"use server"

import { REGISTER_URL } from "@/lib/apiEndPoints"
import axios, { AxiosError } from "axios"

export async function registerAction(prevState: any, formdata: FormData){
    try{
        const payload = Object.fromEntries(formdata.entries())
        const { data } =  await axios.post(REGISTER_URL, payload)

        return{
            status: 200,
            message: data?.message ?? "Account created successfully. Please check and verify your email",
            errors: {}
        }
    }

    catch(error){
        if(error instanceof AxiosError){
            if(error.response?.status === 422){
                return {
                    status: 422,
                    message: error.response.data.message,
                    errors: error.response.data.errors
                }
            }
        }

        return {
            status: 500,
            message: "There was an error while registering the user",
            errors: {}
        }
    }

    console.log("The form data is", formdata)
}