'use client';
import React from 'react'
import { useAuth } from 'reactfire'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { toast } from '../ui/use-toast'

type Props = {}

const AddUserForm = (props: Props) => {
    const auth = useAuth()
    const [isLoading, setIsLoading] = React.useState(false)
    const [newUser, setNewUser] = React.useState({
        email: '',
        password: '',
        name: '',
        role: 'fellow',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (auth.currentUser === null) {
            return
        }
        if (!/^\S+@\S+\.\S+$/.test(newUser.email)) {
            toast({ title: 'Enter a valid email address' })
            return
        }
        if (newUser.password.length < 8) {
            toast({ title: 'Password must be at least 8 characters' })
            return
        }

        setIsLoading(true)
        try {
            const idToken = await auth.currentUser.getIdToken()
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify(newUser),
            })

            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                toast({
                    title: 'Failed to create user',
                    description: body.error ?? `Request failed (${res.status})`,
                })
                return
            }

            toast({
                title: 'User created',
                description: `${newUser.email} can sign in with the temporary password you set. Share it with them securely and have them change it.`,
            })
            setNewUser({ email: '', password: '', name: '', role: 'fellow' })
        } catch (err) {
            console.error(err)
            toast({ title: 'Failed to create user', description: `${err}` })
        } finally {
            setIsLoading(false)
        }
    }

  return (
    <Card className="col-span-3">
        <CardHeader>
            <CardTitle className="pb-2">Add New User</CardTitle>
        </CardHeader>
        <CardContent className="flex-col gap-10">
        <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading} className="space-y-4">

            <Input
            placeholder="User Email"
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            value={newUser.email}
            />

            <Input
            placeholder="Temporary Password (min 8 characters)"
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            value={newUser.password}
            />

            <Input
            placeholder="User Name"
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            value={newUser.name}
            />

            <Select
            onValueChange={(v) => setNewUser({...newUser, role: v})}
            value={newUser.role}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="fellow">Fellow</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Button type="submit">Create User</Button>
            </fieldset>
            </form>
        </CardContent>
        </Card>
  )
}

export default AddUserForm
