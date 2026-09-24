import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    studentId: {type:String, required: true,unique:true,trim: true},
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    branch: { type: String, required: true, trim: true },
    Year: { type: Number, required: true },
    isPaid: { type: Boolean, default: false, required: true },    
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    markedAt: { type: Date, default: null },

    ticketStatus: {
    type: String,
    enum: ["NOT_SENT", "PROCESSING", "SENT", "FAILED", "QUEUED"],
    default: "NOT_SENT"
},
});

const Student = mongoose.model('Student', studentSchema);

export default Student;