'use client';

import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ComponentProps } from 'react';

type LinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & { to: string };

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <NextLink href={to} {...rest}>
      {children}
    </NextLink>
  );
}

export function useLocation() {
  const pathname = usePathname() || '/';
  return { pathname } as const;
}

export function useNavigate() {
  const router = useRouter();
  return (to: string) => router.push(to);
}


