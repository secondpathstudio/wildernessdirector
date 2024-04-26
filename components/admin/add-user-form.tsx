import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@radix-ui/react-select'
import React from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

type Props = {}

const AddUserForm = (props: Props) => {
    const [isLoading, setIsLoading] = React.useState(false)
    const [newUser, setNewUser] = React.useState({
        email: '',
        password: '',
        name: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const userToAdd = {
            ...newUser,
            isAdmin: false,
        }

        console.log('add user', userToAdd)
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
            placeholder="User Password" 
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            value={newUser.password}
            />

            <Input 
            placeholder="User Name" 
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            value={newUser.name}
            />

            {/* Submit button */}
            <Button>Create User</Button>
            </fieldset>
            </form>
        </CardContent>
        </Card>
  )
}

export default AddUserForm