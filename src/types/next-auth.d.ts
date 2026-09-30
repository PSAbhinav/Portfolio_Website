import 'next-auth'
declare module 'next-auth' { interface Session { ownerSid: string; ownerSub: string } }
