import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";


const VerifyQuerySchema = z.object({
    code: verifySchema.shape.code
})

export async function POST(request: Request) {
    await dbConnect();
    try {

        const { username, code } = await request.json();

        const result = VerifyQuerySchema.safeParse({
            code
        });

        if (!result.success) {
            const verifyCodeErrors = result.error.format().code?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: verifyCodeErrors?.length > 0 ? verifyCodeErrors.join(', ') : 'Invalid query parameters'
                },
                { status: 402 }
            );
        }

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({
            username: decodedUsername
        });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                { status: 200 }
            );
        } else if (!isCodeValid) {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code"
                },
                { status: 406 }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code expired. Please signup again to get new code."
                },
                { status: 406 }
            );
        }

    } catch (error) {
        console.error("Error verifying user ", error);
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },
            { status: 500 }
        );
    }
}