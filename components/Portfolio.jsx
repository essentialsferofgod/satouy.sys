"use client";
import { useEffect, useState } from "react";
import { profile, socials, playlist, background, viewCounter } from "../lib/config";
import BackgroundLayer from "./BackgroundLayer";
import Particles from "./Particles";
import CustomCursor from "./CustomCursor";
import TiltCard from "./TiltCard";
import SocialLinks from "./SocialLinks";
import Presence from "./Presence";
import MusicPlayer from "./MusicPlayer";
import EnterGate from "./EnterGate";
import SettingsPanel from "./SettingsPanel";
import SparkleText from "./SparkleText";
import Badges from "./Badges";
import ViewCounter from "./ViewCounter";
import useTypewriter from "../hooks/useTypewriter";
import useLanyard, { discordAvatarUrl, readCachedAvatar } from "../hooks/useLanyard";

const DEFAULTS = { shader: true, particles: true, cursor: true, tilt: true };

export default function Portfolio() {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem("pf-settings") || "null"); if (s) setSettings({ ...DEFAULTS, ...s }); } catch {}
  }, []);
  const update = (s) => { setSettings(s); try { localStorage.setItem("pf-settings", JSON.stringify(s)); } catch {} };

  const enter = () => { setLeaving(true); setTimeout(() => setEntered(true), 700); };
  const typed = useTypewriter(profile.phrases, { enabled: leaving || entered });

  // uma consulta só para a página inteira: o card e o bloco de presença usam a mesma
  const { data: lanyard, failed: lanyardFailed } = useLanyard(profile.discordId);
  // foto guardada da visita anterior: evita o piscar do avatar de reserva.
  // Lida depois da montagem, senão o HTML do servidor e o do cliente divergem.
  const [cachedAvatar, setCachedAvatar] = useState(null);
  useEffect(() => {
    if (profile.useDiscordAvatar) setCachedAvatar(readCachedAvatar(profile.discordId));
  }, []);

  const discordAvatar = profile.useDiscordAvatar ? discordAvatarUrl(lanyard?.discord_user, 256) : null;
  const avatarSrc = discordAvatar || cachedAvatar || profile.avatar;

  return (
    <main className="stage">
      <BackgroundLayer enabled={settings.shader} />
      {settings.particles && <Particles mode={background.effect || "dust"} />}
      {settings.cursor && <CustomCursor />}

      {!entered && <EnterGate onEnter={enter} leaving={leaving} />}

      <div className={`content ${leaving ? "content-in" : ""}`}>
        <SettingsPanel settings={settings} onChange={update} />

        <TiltCard enabled={settings.tilt}>
          <img className="avatar" src={avatarSrc} alt={profile.name} width="108" height="108" />
          <h1 className="name">
            <SparkleText>{profile.name}</SparkleText>
            <Badges items={profile.badges} />
          </h1>
          <p className="tagline">{typed}<span className="caret" /></p>
          <p className="loc">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.500a2.5 2.5 0 0 1 0 5z" /></svg>
            {profile.location}
          </p>
          <Presence discordId={profile.discordId} data={lanyard} failed={lanyardFailed}
                    fallbackAvatar={avatarSrc} name={profile.name} />
          <SocialLinks items={socials} />
        </TiltCard>

        {(entered || leaving) && <MusicPlayer tracks={playlist} autoStart={entered || leaving} />}
      </div>

      {(entered || leaving) && viewCounter?.enabled && (
        <ViewCounter namespace={viewCounter.namespace} keyName={viewCounter.key} />
      )}
    </main>
  );
}
