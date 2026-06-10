import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/context/AppContext";
import { AccontProps } from "@/type";
import {
  AlertTriangle, Briefcase, Camera, CheckCircle2,
  Crown, Edit, FileText, Mail, NotepadText,
  Phone, RefreshCcw, Upload, UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useRef, useState } from "react";

const Info: React.FC<AccontProps> = ({ user, isYourAccount }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const editRef = useRef<HTMLButtonElement | null>(null);
  const resumeRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const { updateProfilePic, updateResume, btnLoading, updateUser } = useAppData();
  const router = useRouter();

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      updateProfilePic(formData);
    }
  };

  const changeResume = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") { alert("Please upload a pdf file"); return; }
      const formData = new FormData();
      formData.append("file", file);
      updateResume(formData);
    }
  };

  const handleEditClick = () => {
    editRef.current?.click();
    setName(user.name);
    setPhoneNumber(user.phone_number);
    setBio(user.bio || "");
  };

  const isSubscribed = user.subscription && new Date(user.subscription).getTime() > Date.now();
  const isExpired = user.subscription && new Date(user.subscription).getTime() <= Date.now();

  return (
    <Card className="overflow-hidden shadow-lg border-2">
      {/* Cover */}
      <div className="h-36 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 relative">
        {isSubscribed && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-400/90 text-yellow-900 text-xs font-bold shadow">
            <Crown size={13} /> PRO Member
          </div>
        )}
        <div className="absolute -bottom-16 left-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden shadow-xl bg-background ring-4 ring-blue-500/20">
              <img
                src={user.profile_pic || "/user.png"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isYourAccount && (
              <>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera size={16} />
                </button>
                <input type="file" className="hidden" accept="image/*" ref={inputRef} onChange={changeHandler} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-8 px-6 md:px-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
              {isYourAccount && (
                <button onClick={handleEditClick} className="p-1.5 rounded-lg hover:bg-accent transition-colors opacity-60 hover:opacity-100">
                  <Edit size={15} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm opacity-60">
              <Briefcase size={14} />
              <span className="capitalize">{user.role}</span>
            </div>
          </div>
          {user.role === "jobseeker" && user.resume && (
            <div className="flex items-center gap-2">
              <Link href={user.resume} target="_blank">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <FileText size={15} /> View Resume
                </Button>
              </Link>
              {isYourAccount && (
                <>
                  <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => resumeRef.current?.click()}>
                    <Upload size={15} /> Update
                  </Button>
                  <input type="file" ref={resumeRef} className="hidden" accept="application/pdf" onChange={changeResume} />
                </>
              )}
            </div>
          )}
          {user.role === "jobseeker" && !user.resume && isYourAccount && (
            <>
              <Button variant="outline" size="sm" className="gap-2 h-9" onClick={() => resumeRef.current?.click()}>
                <Upload size={15} /> Upload Resume
              </Button>
              <input type="file" ref={resumeRef} className="hidden" accept="application/pdf" onChange={changeResume} />
            </>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm leading-relaxed opacity-75 mb-6 p-4 rounded-xl bg-secondary border">
            {user.bio}
          </p>
        )}

        {/* Contact */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-400 transition-colors">
            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              <Mail size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs opacity-50 font-medium">Email</p>
              <p className="text-sm truncate font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border hover:border-blue-400 transition-colors">
            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0">
              <Phone size={16} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs opacity-50 font-medium">Phone</p>
              <p className="text-sm truncate font-medium">{user.phone_number || "Not added"}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        {isYourAccount && user.role === "jobseeker" && (
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between gap-4 flex-wrap ${isSubscribed ? "border-green-300 bg-green-50 dark:bg-green-950/20" : isExpired ? "border-red-300 bg-red-50 dark:bg-red-950/20" : "border-dashed"}`}>
            <div className="flex items-center gap-3">
              <Crown size={20} className={isSubscribed ? "text-yellow-500" : "opacity-40"} />
              <div>
                {!user.subscription && <p className="font-semibold text-sm">No Active Subscription</p>}
                {isSubscribed && <p className="font-semibold text-sm text-green-600">PRO Active</p>}
                {isExpired && <p className="font-semibold text-sm text-red-600">Subscription Expired</p>}
                <p className="text-xs opacity-60">
                  {isSubscribed && `Valid until ${new Date(user.subscription!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                  {isExpired && `Expired ${new Date(user.subscription!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                  {!user.subscription && "Unlock priority applications & more"}
                </p>
              </div>
            </div>
            {!isSubscribed && (
              <Button size="sm" className="gap-2 h-9" onClick={() => router.push("/subscribe")} variant={isExpired ? "destructive" : "default"}>
                {isExpired ? <><RefreshCcw size={14} /> Renew</> : <><Crown size={14} /> Subscribe</>}
              </Button>
            )}
            {isSubscribed && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <CheckCircle2 size={16} /> Subscribed
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button ref={editRef} className="hidden">Edit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit size={20} className="text-blue-600" /> Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><UserIcon size={15} /> Full Name</Label>
              <Input placeholder="Enter your name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone size={15} /> Phone</Label>
              <Input type="number" placeholder="Enter your phone number" className="h-11" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            {user.role === "jobseeker" && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><FileText size={15} /> Bio</Label>
                <textarea
                  placeholder="Tell us about yourself..."
                  className="w-full h-24 px-3 py-2 border-2 border-gray-300 rounded-lg bg-transparent text-sm resize-none focus:outline-none focus:border-blue-500"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button disabled={btnLoading} onClick={() => updateUser(name, phoneNumber, bio)} className="w-full h-11">
              {btnLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Info;
