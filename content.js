/* Everything personal lives in this one file.
   Change the words here; you never need to touch the other files.
   Lines marked PLACEHOLDER still need your real words. */

window.CONTENT = {
  // The very first screen: a heart that fills while it is held
  heart: {
    cue: 'Press and hold the heart',
    full: "It's yours."
  },

  // The lock screen
  passcode: '221025',
  hint: 'the first day we started dating',

  // Names
  to: 'my love',        // PLACEHOLDER: their name or nickname
  from: 'Jean Jac',     // signed under the letter
  sealInitials: '',     // one or two letters pressed into the wax seal; empty shows a heart

  // The big reveal
  reveal: {
    lines: ['Happy', 'Anniversary'],
    sub: 'Our first year',
    dates: '22 October 2025 to 22 October 2026'
  },

  // The letter. One string per paragraph.
  letter: {
    greeting: 'My love,',
    paragraphs: [
      "A year ago on 22 October, we started dating, and I had no idea how much it would change my life. Today I can't picture this year without you in it.",
      "I think about your smile more than I'd probably admit. It's the first thing I look for, and it makes the hard days feel lighter. The toy you gave me is still with me too. You didn't have to think of me, but you did, and I'll keep it.",
      "You are the most considerate person I know. You notice what I need before I ask, and you keep doing it even in the small everyday things. I still remember the day we went swimming at Whizdom, how easy it felt just to be together. Those ordinary moments are the ones I love most.",
      "A year is a short time to know someone this well, but I'm sure about you. I love you, all of you, not just the parts I can list. Here's to the next year, and to every one after that."
    ],
    signoff: 'Yours, always',
    photos: [
      'photos/us/S__10895365.jpg',
      'photos/us/S__10895387.jpg',
      'photos/us/S__10895371.jpg'
    ]
  },

  // Flowers. Each reason opens another share of the roses, so any number works (six to nine reads best).
  reasons: [
    "Your smile. It is the first thing I look for, and it makes a hard day feel lighter.",
    "The fluffy toy you gave me. Every time I see it, I remember you thought of me.",
    "How considerate you are, even in the small things you never mention.",
    "Swimming at Whizdom with you. I keep replaying that day.",
    "How easily you make an ordinary day feel worth remembering.",
    "The way you care about the people around you, and how gently you do it.",
    "Honestly? I love you. All of you, not just the parts I can list."
  ],
  reasonsClosing: 'And I am still counting.',

  // The song. Paste a YouTube or Spotify link.
  song: {
    title: 'Snowman',
    artist: 'Sia',
    link: 'https://open.spotify.com/track/3E6Ydoy1H8ePoigc10Mgsa',
    labelLine: '22 October 2025',   // small line printed on the record's label
    note: "It's the song I think of when I think about you. You're my home."
  },

  // Memories. The order the photo folders appear in.
  memories: {
    order: ['us', 'you', 'me', 'silly', 'outings', 'food', 'flowers', 'friends', 'games']
  }
};
