import * as mongoose from "mongoose";
import validator from 'validator';
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const schema = new mongoose.Schema({
    userId:{},
    isAdmin: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        validate(value: any) {
            let re = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$");
            if (validator.isEmpty(value)) {
                throw new Error("First name cannot be empty");
            } else if (!re.test(value)) {
                throw new Error("First name contains certain characters that aren't allowed");
            }
        },
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        validate(value: any) {
            let re = new RegExp("^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$");

            if (validator.isEmpty(value)) {
                throw new Error("Last name cannot be empty");
            } else if (!re.test(value)) {
                throw new Error("Last name contains certain characters that aren't allowed");
            }
        },
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value: any) {
            if (!validator.isEmail(value)) {
                throw new Error("Please Enter valid email address");
            } else if (validator.isEmpty(value)) {
                throw new Error("Email cannot be empty");
            }
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value: any) {
            if (validator.isEmpty(value)) {
                throw new Error("User Password cannot be empty");
            } else if (!validator.isStrongPassword(value, {
                minLength: 8, minLowercase: 1,
                minUppercase: 1, minNumbers: 1, minSymbols: 1
            })) {
                throw new Error('Please choose a more secure password. It should be longer than 8 characters, unique to you and difficult for others to guess.');
            }
        },
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isEnabled:{
        type:Boolean,
        required:true,
        default:false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});
schema.pre("save", async function (next: any) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});


interface IUser {
    isAdmin: boolean;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    isEnabled: boolean;
    tokens: { token: string; }[];
    generateAuthToken():string;

}
interface IUserModel extends mongoose.Model<IUser> {
    findByCredentials(email:string, password:string): Promise<IUser>;
}
schema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() },"botmonitorsecret");
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};
schema.statics.findByCredentials = async function(email:string, password:string){
    const user = await User.findOne({email:email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user;
}

// const User = mongoose.model("User", schema);
const User = mongoose.model<IUser, IUserModel>("User", schema);

export { User };