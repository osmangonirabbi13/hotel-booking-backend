import { RoomCategory } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"

const createRoomCategory = async (payload : RoomCategory) : Promise<RoomCategory> =>{

    const roomcategory = await prisma.roomCategory.create({
        data : payload
    })  

    return roomcategory

}

export const RoomCategoryService = {
    createRoomCategory
}