import { Track } from '../types';

export const BUILTIN_TRACKS: Track[] = [
  {
    id: 'track-cyberwave',
    title: 'Neon Odyssey 2099',
    artist: 'VIBEWAVE Sound System',
    album: 'Synthetic Horizons',
    duration: 144, // 2m 24s
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    mood: 'Energetic',
    bpm: 128,
    genre: 'Cyberpunk Synthwave',
    bitDepth: '24-bit',
    sampleRate: '96 kHz',
    format: 'FLAC / Hi-Fi',
    isHiFi: true,
    isProcedural: true,
    synthStyle: 'cyberpunk',
    sections: [
      { type: 'Intro', startTime: 0, endTime: 15, label: 'Neon Dawn' },
      { type: 'Verse', startTime: 15, endTime: 45, label: 'Cruising the Grid' },
      { type: 'Chorus', startTime: 45, endTime: 75, label: 'Electric Pulse (Peak)' },
      { type: 'Verse', startTime: 75, endTime: 105, label: 'High Velocity' },
      { type: 'Drop', startTime: 105, endTime: 125, label: 'Cyber Bass Drop' },
      { type: 'Outro', startTime: 125, endTime: 144, label: 'Fade to Binary' },
    ],
    rawLyricsText: `[00:02.00] Ignition sequence start...
[00:07.50] Scanning the grid beneath the towers
[00:15.00] Neon rain cuts through the midnight sky
[00:22.40] Electric echoes screaming far and high
[00:30.00] Speed of sound across the chrome highway
[00:37.80] We leave the shadows of yesterday
[00:45.00] Feel the frequency! Feel the surge!
[00:52.50] Where reality and dreams converge!
[01:00.00] Vibewave pulsing through our veins
[01:07.50] Burning bright through digital chains
[01:15.00] Accelerate into the hyper-light
[01:22.50] No looking back into the endless night
[01:30.00] The bass hits hard, the sirens call
[01:37.50] Together we will break the firewall
[01:45.00] Vibewave! Maximum overdrive!
[01:52.50] Here is where we come alive!
[02:05.00] Dropping into the quantum stream...
[02:18.00] Fade out into the cyber dream...`,
  },
  {
    id: 'track-midnight-rain',
    title: 'Raindrops in Violet',
    artist: 'Luna & The Echoes',
    album: 'Midnight Nostalgia',
    duration: 135,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    mood: 'Sad',
    bpm: 82,
    genre: 'Lofi Ambient Soul',
    bitDepth: '24-bit',
    sampleRate: '48 kHz',
    format: 'Lossless Studio',
    isHiFi: true,
    isProcedural: true,
    synthStyle: 'lofi',
    sections: [
      { type: 'Intro', startTime: 0, endTime: 18, label: 'Gentle Rain' },
      { type: 'Verse', startTime: 18, endTime: 48, label: 'Empty Streetlamps' },
      { type: 'Chorus', startTime: 48, endTime: 80, label: 'Echoes of You' },
      { type: 'Bridge', startTime: 80, endTime: 105, label: 'Distant Thunder' },
      { type: 'Outro', startTime: 105, endTime: 135, label: 'Passing Storm' },
    ],
    rawLyricsText: `[00:03.00] Rain tapping against the bedroom glass...
[00:10.00] Watching cold shadows quietly pass
[00:18.00] The city breathes in shades of deep blue
[00:26.00] And every quiet corner reminds me of you
[00:34.00] Coffee getting cold on the table side
[00:42.00] Nowhere left for memories to hide
[00:48.00] I still hear your laughter in the halls
[00:56.00] Like soft echoes bouncing off the walls
[01:05.00] Violet teardrops falling on the street
[01:14.00] A melancholic rhythm, bittersweet
[01:22.00] Wish I could turn the hands of time
[01:30.00] Back when your heartbeat answered mine
[01:40.00] The night settles slow and still...
[01:55.00] Goodnight, wherever you are...`,
  },
  {
    id: 'track-golden-euphoria',
    title: 'Solar Radiance',
    artist: 'Aura Bloom',
    album: 'Summer Sunsets',
    duration: 140,
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    mood: 'Happy',
    bpm: 124,
    genre: 'Nu-Disco Euphoria',
    bitDepth: '24-bit',
    sampleRate: '96 kHz',
    format: 'Master FLAC',
    isHiFi: true,
    isProcedural: true,
    synthStyle: 'cyberpunk',
    sections: [
      { type: 'Intro', startTime: 0, endTime: 12, label: 'Sunrise Shimmer' },
      { type: 'Verse', startTime: 12, endTime: 42, label: 'Golden Coast' },
      { type: 'Chorus', startTime: 42, endTime: 78, label: 'Pure Sunlight' },
      { type: 'Verse', startTime: 78, endTime: 104, label: 'Endless Horizon' },
      { type: 'Outro', startTime: 104, endTime: 140, label: 'Warm Glow' },
    ],
    rawLyricsText: `[00:02.00] Sunshine spilling through the golden bay
[00:08.00] Waking up to the brightest summer day
[00:14.00] Kick off your shoes, feel the warm ocean breeze
[00:22.00] Swaying in rhythm with the palm tree leaves
[00:30.00] Life is a melody, sweet and clear
[00:36.00] No room for sorrow, no room for fear
[00:42.00] We got that golden glow in our eyes!
[00:50.00] Dancing beneath the open skies!
[00:58.00] Nothing can dim the joy we found
[01:06.00] Higher and higher off the ground!
[01:14.00] Sing it out loud, let the music roll
[01:22.00] Pure positive energy for the soul!
[01:32.00] Shining on, forever bright...`,
  },
  {
    id: 'track-epic-horizon',
    title: 'Crown of Titans',
    artist: 'Valhalla Ensemble',
    album: 'Odyssey of Realms',
    duration: 150,
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    mood: 'Cinematic',
    bpm: 104,
    genre: 'Hybrid Epic Orchestral',
    bitDepth: '24-bit',
    sampleRate: '96 kHz',
    format: 'DSD / Hi-Res',
    isHiFi: true,
    isProcedural: true,
    synthStyle: 'cinematic',
    sections: [
      { type: 'Intro', startTime: 0, endTime: 20, label: 'Distant Drums' },
      { type: 'Verse', startTime: 20, endTime: 55, label: 'The Gathering' },
      { type: 'Chorus', startTime: 55, endTime: 90, label: 'Titanic Awakening' },
      { type: 'Drop', startTime: 90, endTime: 115, label: 'The Clash of Worlds' },
      { type: 'Outro', startTime: 115, endTime: 150, label: 'Dawn of Heroes' },
    ],
    rawLyricsText: `[00:05.00] From the mountains older than stone...
[00:12.00] A thunder awakens the ancient throne
[00:22.00] Banners unfurl in the crimson gale
[00:30.00] Iron spirits that will never fail
[00:40.00] Stand fast! The horizon breaks!
[00:48.00] With every step the earth now shakes!
[00:56.00] Rise, Titans! Answer the call!
[01:05.00] We will conquer or we will stand tall!
[01:15.00] The heavens ignite with roaring flame
[01:25.00] Carving in legend our eternal name!
[01:38.00] Into glory, into the light...
[01:50.00] Champions of the endless fight...`,
  },
  {
    id: 'track-intimate-starlight',
    title: 'Starlight Serenade',
    artist: 'Celeste Amour',
    album: 'Velvet Nights',
    duration: 130,
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    mood: 'Romantic',
    bpm: 76,
    genre: 'Intimate Neo-Classical',
    bitDepth: '24-bit',
    sampleRate: '96 kHz',
    format: 'Studio Master',
    isHiFi: true,
    isProcedural: true,
    synthStyle: 'ambient_piano',
    sections: [
      { type: 'Intro', startTime: 0, endTime: 16, label: 'Prelude of Stars' },
      { type: 'Verse', startTime: 16, endTime: 48, label: 'Whispers in Candlelight' },
      { type: 'Chorus', startTime: 48, endTime: 82, label: 'Heart to Heart' },
      { type: 'Verse', startTime: 82, endTime: 110, label: 'Timeless Waltz' },
      { type: 'Outro', startTime: 110, endTime: 130, label: 'Resting in Arms' },
    ],
    rawLyricsText: `[00:04.00] Moonlight dances across your face...
[00:12.00] Lost together in this sacred space
[00:20.00] Every breath feels like a secret vow
[00:28.00] The whole world fades away right now
[00:38.00] Hold my hand as the candles glow
[00:46.00] A love deeper than the oceans go
[00:54.00] You are my shelter, you are my home
[01:03.00] With you I never will walk alone
[01:12.00] Starlight singing our tender song
[01:21.00] Right here in your embrace I belong
[01:32.00] Forever and ever, my love...`,
  },
];
