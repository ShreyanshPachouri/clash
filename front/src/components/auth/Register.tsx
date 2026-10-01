"use client"

import { useEffect } from 'react'
import { Label } from '../ui/label'
import { registerAction } from '@/actions/authActions'
import { SubmitButton } from '../common/SubmitButton'
import { Input } from '../ui/input'
import { useActionState } from "react";
import { toast } from 'sonner'

export default function Register() {
    const initState = {
        status: 0,
        message: "",
        errors: {}
    }

    const[state, formAction] = useActionState(registerAction, initState)
    useEffect(() => {
        if (state.status === 500) {
            toast.error(state.message)
        }

        else if(state.status === 200){
            toast.success(state.message)
        }
    }, [state])

    return (
        <form action = { formAction }>
            <div className = "mt-4">
                <Label htmlFor = "name">Name</Label>
                <Input id = "name" type = "text" name = "name" placeholder = "Enter your name"></Input>
                <span className = "text-red-500">{state.errors.name}</span>
            </div>

            <div className = "mt-4">
                <Label htmlFor = "email">Email</Label>
                <Input id = "email" type = "email" name = "email" placeholder = "Enter your email"></Input>
                <span className = "text-red-500">{state.errors.email}</span>
            </div>

            <div className = "mt-4">
                <Label htmlFor = "password">Password</Label>
                <Input id = "password" type = "password" name = "password" placeholder = "Enter your password">
                </Input>
                <span className = "text-red-500">{state.errors.password}</span>
            </div>

            <div className = "mt-4">
                <Label htmlFor = "cpassword">Confirm Password</Label>
                <Input id = "cpassword" type = "password" name = "confirm_password" placeholder = "Confirm your password">
                </Input>
                <span className = "text-red-500">{state.errors.confirm_password}</span>
            </div>

            <div className = "mt-4">
                <SubmitButton />
            </div>
        </form>
    )
}
