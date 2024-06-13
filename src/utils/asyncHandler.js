import { Promise } from "mongoose"

// It will create a method and export it.
const asyncHandler = (requestHandler) =>{
    (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
}



export {asyncHandler}


// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//           success: false,
//           message: err.message
//         })
//     }

// }

