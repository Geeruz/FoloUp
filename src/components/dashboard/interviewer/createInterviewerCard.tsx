import Modal from "@/components/dashboard/Modal";
import { avatars } from "@/components/dashboard/interviewer/avatars";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useInterviewers } from "@/contexts/interviewers.context";
import { useClerk } from "@clerk/nextjs";
import { Image as LucideImage } from "lucide-react";
import { Plus } from "lucide-react";
import Image from "next/image";
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { useEffect, useState } from "react";

const createInterviewerCard = () => {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [name, setName] = useState("");
  const [empathy, setEmpathy] = useState(0.4);
  const [rapport, setRapport] = useState(0.7);
  const [exploration, setExploration] = useState(0.2);
  const [speed, setSpeed] = useState(0.9);
  const [image, setImage] = useState("");
  const { createInterviewer } = useInterviewers();
  const { user } = useClerk();
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmpathy(0.4);
      setRapport(0.7);
      setExploration(0.2);
      setSpeed(0.9);
      setImage("");
    }
  }, [open]);

  const onSave = async () => {
    await createInterviewer({
      name: name,
      empathy: empathy * 10,
      rapport: rapport * 10,
      exploration: exploration * 10,
      speed: speed * 10,
      user_id: user?.id,
      image: image,
    });
    setIsClicked(false);
    setOpen(false);
  };

  return (
    <>
      <div className="flex w-full cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-100 text-sky-700 shadow-sm">
          <Plus size={32} />
        </div>
        <CardTitle className="text-lg font-semibold">New Interviewer</CardTitle>
        <p className="mt-2 text-sm leading-6 text-slate-500 text-center">
          Create a custom AI interviewer persona tailored to your evaluation needs.
        </p>
        <Button className="mt-6 rounded-full px-6 py-3" onClick={() => setOpen(true)}>
          Create Interviewer
        </Button>
      </div>

      <Modal open={open} closeOnOutsideClick={true} onClose={() => setOpen(false)}>
        <div className="text-center w-[40rem] rounded-[1.75rem] bg-slate-950 p-8 text-white shadow-2xl">
          <CardTitle className="text-3xl font-semibold leading-tight text-white">Create Interviewer</CardTitle>
          <p className="mt-2 text-sm text-slate-300">
            Configure personality traits, choose an avatar, and save a reusable interviewer profile.
          </p>

          <div className="mt-8 flex gap-10">
            <button
              type="button"
              className="flex h-56 w-52 flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-sky-400"
              onClick={() => setGallery(true)}
            >
              {image ? (
                <Image
                  src={image}
                  alt="Interviewer avatar"
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <LucideImage className="text-slate-500" size={80} strokeWidth={1.2} />
                  <span className="mt-4 text-sm font-medium text-slate-300">Choose an avatar</span>
                </>
              )}
            </button>

            <div className="flex-1 space-y-6 text-left">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">Name</label>
                <input
                  type="text"
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
                  placeholder="e.g. Empathetic Bob"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Empathy", value: empathy, setter: setEmpathy },
                  { label: "Rapport", value: rapport, setter: setRapport },
                  { label: "Exploration", value: exploration, setter: setExploration },
                  { label: "Speed", value: speed, setter: setSpeed },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                    <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                      <span>{item.label}</span>
                      <span>{item.value.toFixed(1)}</span>
                    </div>
                    <Slider
                      value={[item.value]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => item.setter(value[0])}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              disabled={!(name && image) || isClicked}
              className="rounded-full bg-sky-500 px-8 py-3 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400"
              onClick={() => {
                setIsClicked(true);
                onSave();
              }}
            >
              Save Interviewer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={gallery} closeOnOutsideClick={true} onClose={() => setGallery(false)}>
        <div className="text-left w-[24rem] rounded-[1.5rem] bg-white p-6 shadow-2xl">
          <CardTitle className="text-2xl font-semibold text-slate-900">Choose Avatar</CardTitle>
          <ScrollArea className="mt-4 h-96 rounded-3xl border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-3">
              {avatars.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition hover:border-sky-500"
                  onClick={() => {
                    setImage(item.img);
                    setGallery(false);
                  }}
                >
                  <Image alt="avatar" width={160} height={160} src={item.img} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Modal>
    </>
  );
};

export default createInterviewerCard;
