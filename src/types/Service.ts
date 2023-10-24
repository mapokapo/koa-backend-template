import { Context } from "koa";

export default interface Service<
	Entity,
	PostRequest,
	PatchRequest,
	KoaContext extends Context = Context,
	UserIdType extends string | number = string,
	IdType extends string | number = number
> {
	getAll: (ctx: KoaContext) => Promise<Entity[]>;
	getById: (ctx: KoaContext, id: IdType) => Promise<Entity | null>;
	create: (
		ctx: KoaContext,
		uid: UserIdType,
		data: PostRequest
	) => Promise<Entity>;
	update: (ctx: KoaContext, id: IdType, data: PatchRequest) => Promise<Entity>;
	delete: (ctx: KoaContext, id: IdType) => Promise<Entity>;
}
