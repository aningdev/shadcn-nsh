// The avatars' people, by name (`avatarPortrait`): demo content only, never in the registry.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

/** NSH's maintainers, by name: their GitHub logins and account ids. */
export const MAINTAINERS = [
  { name: "Jason Lee", login: "huacnlee", id: 5518 },
  { name: "Sunli", login: "sunli829", id: 20092316 },
  { name: "Floyd Wang", login: "madcodelife", id: 28998859 },
] as const;

/**
 * The GitHub picture of `name`, one of NSH's maintainers (160 px, sharp
 * at the demos' largest avatar), or none for anyone else: they show their
 * initials.
 */
export function avatarPortrait(name: string): string | undefined {
  const person = MAINTAINERS.find((m) => m.name === name);
  return person && `https://avatars.githubusercontent.com/u/${person.id}?s=160`;
}

/** An image that never loads (bytes no decoder reads): the avatar's
 * fallback shows, as for a picture that is gone. */
export const AVATAR_BROKEN = "data:image/png;base64,AAAA";
