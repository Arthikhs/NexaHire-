"use client";
import { user_service } from "@/context/AppContext";
import { useAppData } from "@/context/AppContext";
import axios from "axios";
import { Award, ThumbsUp, Users, Loader2, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface EndorsementGroup {
  skill_name: string;
  count: number;
  endorsers: { endorser_id: number; endorser_name: string }[];
}

interface Props {
  profileUserId: number;
  skills: string[];
}

const SkillEndorsements = ({ profileUserId, skills }: Props) => {
  const { user, isAuth } = useAppData();
  const token = Cookies.get("token");
  const [endorsements, setEndorsements] = useState<EndorsementGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [endorsing, setEndorsing] = useState<string | null>(null);

  const isOwnProfile = user?.user_id === profileUserId;

  const fetchEndorsements = async () => {
    try {
      const { data } = await axios.get(`${user_service}/api/user/endorsements/${profileUserId}`);
      setEndorsements(data);
    } catch { setEndorsements([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEndorsements(); }, [profileUserId]);

  const endorse = async (skill_name: string) => {
    if (!isAuth) { toast.error("Sign in to endorse"); return; }
    setEndorsing(skill_name);
    try {
      await axios.post(`${user_service}/api/user/endorse/${profileUserId}`, { skill_name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Endorsed ${skill_name}!`);
      fetchEndorsements();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to endorse");
    } finally { setEndorsing(null); }
  };

  const getCount = (skill: string) => endorsements.find((e) => e.skill_name === skill)?.count ?? 0;
  const hasEndorsed = (skill: string) =>
    endorsements.find((e) => e.skill_name === skill)?.endorsers.some((e) => e.endorser_id === user?.user_id) ?? false;

  if (skills.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2 text-sm">
        <Award size={16} className="text-blue-600" /> Skills & Endorsements
      </h3>
      {loading ? (
        <div className="flex items-center gap-2 text-sm opacity-50"><Loader2 size={14} className="animate-spin" /> Loading...</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const count = getCount(skill);
            const endorsed = hasEndorsed(skill);
            return (
              <div key={skill} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${endorsed ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : "border-gray-200"}`}>
                <span className="text-sm font-medium">{skill}</span>
                {count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                    <ThumbsUp size={11} /> {count}
                  </span>
                )}
                {!isOwnProfile && isAuth && (
                  <button onClick={() => endorse(skill)} disabled={endorsed || endorsing === skill}
                    className={`transition-all ${endorsed ? "text-blue-600" : "text-gray-400 hover:text-blue-600"}`}
                    title={endorsed ? "Already endorsed" : "Endorse this skill"}>
                    {endorsing === skill ? <Loader2 size={13} className="animate-spin" /> : endorsed ? <CheckCircle2 size={13} /> : <ThumbsUp size={13} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Endorsers summary */}
      {endorsements.filter((e) => e.count > 0).length > 0 && (
        <div className="text-xs opacity-50 flex items-center gap-1">
          <Users size={12} />
          {endorsements.reduce((acc, e) => acc + e.count, 0)} total endorsements from the community
        </div>
      )}
    </div>
  );
};

export default SkillEndorsements;
