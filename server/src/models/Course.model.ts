



 const schema = new Schema({
   name: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   avatar: { type: String },
   role: { type: String, default: 'user' },
   isVerified: { type: Boolean, default: false },
   courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
 })