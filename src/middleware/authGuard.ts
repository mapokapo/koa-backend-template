import { Middleware } from "koa";
import { KoaAppContext, KoaAppState } from "../app.js";

/**
 * Middleware that checks the user's auth status and sets ctx.state.user if they are authenticated and meet the requirements.
 * Failure cases:
 * * returns a 401 error if they are not (properly) authenticated
 * * returns a 403 error if they are authenticated and requiredRoles is set but they don't have the required role
 * * returns a 404 error if they are authenticated and requiresProfile or requiredRoles is set but they don't have a profile
 *
 * @param requirements An object specifying auth requirements. If undefined, defaults to requiring a profile and not requiring any roles.
 * @param requirements.requiresProfile Whether or not the user must have a profile. Defaults to true.
 * @param requirements.requiresRoles A string array of role names that the user must have. Implicitly sets requiresProfile to true. Defaults to an empty array.
 * @returns A Koa middleware function that doesn't do anything if the user is authenticated and meets the requirements. Otherwise, it sets the status and body of the response and stops the middleware chain (i.e. returns).
 */
function authGuard(requirements: {
	requiresProfile: boolean;
}): Middleware<KoaAppState, KoaAppContext>;
function authGuard(requirements: {
	requiresRoles: string[];
}): Middleware<KoaAppState, KoaAppContext>;
function authGuard(
	requirements: { requiresProfile: boolean } | { requiresRoles: string[] }
): Middleware<KoaAppState, KoaAppContext> {
	let requiresProfile =
		"requiresProfile" in requirements ? requirements.requiresProfile : true;
	let requiredRoles: string[] =
		"requiresProfile" in requirements ? [] : requirements.requiresRoles;

	const middleware: Middleware<KoaAppState, KoaAppContext> = async (
		ctx,
		next
	) => {
		const idToken = ctx.cookies.get("idToken");
		if (!idToken) {
			ctx.status = 401;
			ctx.body = {
				error: "Unauthorized",
			};
			return;
		}

		try {
			const decodedToken = await ctx.firebaseAdmin
				.auth()
				.verifyIdToken(idToken);

			if (requiresProfile) {
				const profile = await ctx.prisma.profile.findUnique({
					where: {
						firebaseUid: decodedToken.uid,
					},
					include: {
						roles: true,
					},
				});

				if (!profile) {
					ctx.status = 404;
					ctx.body = {
						error: "User not found",
					};
					return;
				}

				if (
					!requiredRoles.every(role =>
						profile.roles.map(r => r.name).includes(role)
					)
				) {
					ctx.status = 403;
					ctx.body = {
						error: "Forbidden",
					};
					return;
				}
				ctx.state.user = profile;
			}

			return next();
		} catch (e) {
			ctx.logger.warn("Failed to verify id token: " + e);
			ctx.status = 401;
			ctx.body = {
				error: "Unauthorized",
			};
			return;
		}
	};
	return middleware;
}

export default authGuard;
