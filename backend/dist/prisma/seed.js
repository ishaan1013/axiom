"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../src/prisma"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma_1.default.user.deleteMany({});
        yield prisma_1.default.workspace.deleteMany({});
        const user = yield prisma_1.default.user.create({
            data: { id: "r34agarw" },
        });
        const workspace = yield prisma_1.default.workspace.create({
            data: {
                project: "Assignment 0",
                users: {
                    connect: { id: user.id },
                },
            },
            include: { users: true },
        });
        console.log("Seeding completed");
        console.log("User:", user);
        console.log("Workspace with connected User:", workspace);
    });
}
main()
    .catch((e) => console.error(e))
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.$disconnect();
}));