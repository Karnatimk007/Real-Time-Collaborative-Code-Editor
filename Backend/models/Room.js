// models/Room.js
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const messageSchema = new mongoose.Schema({
  sender:    String,
  message:   String,
  timestamp: { type: Date, default: Date.now },
});

const participantSchema = new mongoose.Schema({
  username: String,
  socketId: String,
  joinedAt: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema(
  {
    //Room Identity 
    roomId: {
      type:     String,
      required: [true, "Room ID is required"],
      unique:   true,
      match:    [/^\d{6}$/, "Room ID must be exactly 6 digits"],
    },

    // Code & Language 
    code: {
      type:    String,
      default: "",
    },
    language: {
      type:    String,
      default: "javascript",
      enum:    [                  // only allow valid languages
        "javascript",
        "python",
        "cpp",
        "java",
        "c",
        "typescript",
        "go",
        "rust",
      ],
    },

    // Chat Messages ──────────────────────────
    messages: [messageSchema],

    //  Room Creator ───────────────────────────
    createdBy: {
      type:     String,
      required: [true, "Created by is required"],
    },

    //Participants ───────────────────────────
    maxParticipants: {
      type:    Number,
      min:     [2,  "Minimum 2 participants required"],
      max:     [20, "Maximum 20 participants allowed"],
      default: 5,
    },
    activeParticipants: {
      type:    Number,
      default: 0,
    },
    participants: [participantSchema],

    //Room Status ────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
    },

    //  Expiry (TTL) ───────────────────────────
    expiresAt: {
      type:    Date,
      default: null,
    },
    lastEmptiedAt: {
      type:    Date,
      default: null,
    },
    roomDuration: {
      type:    Number,
      default: 30,
      min:     [5, "Minimum room duration is 5 minutes"],
      max:     [1440, "Maximum room duration is 24 hours (1440 minutes)"],
      description: "How long (in minutes) room stays after all users leave"
    },

    // Password Protection ────────────────────
    isProtected: {        
      type:    Boolean,
      default: false,
    },
    password: {
      type:    String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey:false
  }
);

// Auto deletes room after expiresAt
RoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

//  Pre-save Hook ──────────────────────────────
// Hash password only on save()
RoomSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  try {
    const salt   = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err;
  }
});

//  Compare Password Method ────────────────────
RoomSchema.methods.comparePassword = async function (candidatePassword) {
  // Open room
  if (!this.password) return {
    success:     true,
    isProtected: false,
  };

  // Protected room
  const isMatch = await bcrypt.compare(
    candidatePassword,
    this.password
  );

  return {
    success:     isMatch,
    isProtected: true,
  };
};

export default mongoose.model("Room", RoomSchema);