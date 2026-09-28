import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function page(){
    return(
        <div className="flex justify-center items-center h-screen">
            <div className="w-full md:w-[550px] shadow-md rounded-xl py-5 px-10 bg-white">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-500 text-transparent text-center bg-clip-text">
                Clash
            </h1>
            <h1 className="text-3xl font-bold">Login</h1>
            <p>Welcome back</p>
            <form>
                <div className = "mt-4">
                    <Label htmlFor = "email">Email</Label>
                    <Input id = "email" type = "email" name = "email" placeholder = "Enter your email"></Input>
                </div>

                <div className = "mt-4">
                    <Label htmlFor = "password">Password</Label>
                    <Input id = "password" type = "password" name = "password" placeholder = "Enter your password">
                    </Input>
                    <div className = "text-right font-bold">
                        <Link href = "forget-password">Forget password</Link>
                    </div>
                </div>

                <div className = "mt-4">
                    <Button className = "w-full"> Submit </Button>
                </div>
            </form>

            <p className="text-center mt-2">
                Don't have an account ?{" "}
          <strong>
            <Link href="/register">Register</Link>
          </strong>
        </p>
            </div>
        </div>
    )
}
