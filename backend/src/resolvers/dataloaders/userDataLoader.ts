import DataLoader from "dataloader"
import { In } from "typeorm"
import { User } from "../../database/entities/User"

export const userDataLoader = () => new DataLoader<number, User>(async (userIds) => {
    console.log('Hiiiiiiiiiiii')
    const users = await User.find({
        where: {
            id: In(userIds)
        }
    })
    const userMap: Record<number, User> = {}
    users.forEach((user) => {
        userMap[user.id] = user
    })
    return userIds.map((id) => userMap[id])
})