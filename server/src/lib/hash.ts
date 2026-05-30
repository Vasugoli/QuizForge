import { hash, compare } from "bcryptjs";

const HashService = {
	async hash(password: string): Promise<string> {
		return await hash(password, 10);
	},

	async compare(password: string, hash: string): Promise<boolean> {
		return await compare(password, hash);
	},
};

export default HashService;
