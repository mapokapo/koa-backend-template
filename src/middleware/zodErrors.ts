import { Middleware } from "koa";
import { ZodError } from "zod";

const zodErrors = () => {
	const middleware: Middleware = async (ctx, next) => {
		try {
			await next();
		} catch (e) {
			if (e instanceof ZodError) {
				ctx.status = 400;
				ctx.body = {
					error: e.errors,
				};
			} else {
				throw e;
			}
		}
	};

	return middleware;
};

export default zodErrors;
