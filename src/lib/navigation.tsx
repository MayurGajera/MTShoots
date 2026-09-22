'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
  replace?: boolean;
}

export const Link: React.FC<LinkProps> = ({ to, href, children, className, onClick, ...props }) => {
  const destination = href || to || '/';
  return (
    <NextLink href={destination} className={className} onClick={onClick} {...props}>
      {children}
    </NextLink>
  );
};

export const useNavigate = () => {
  const router = useNextRouter();
  return (target: string | number, options?: { replace?: boolean }) => {
    if (typeof target === 'number') {
      if (target === -1) router.back();
      else if (target === 1) router.forward();
    } else {
      if (options?.replace) {
        router.replace(target);
      } else {
        router.push(target);
      }
    }
  };
};

export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return {
    pathname: pathname || '/',
    search: searchParams && searchParams.toString() ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null,
    key: 'default',
  };
};

export const useParams = <T extends Record<string, string | string[]> = Record<string, string>>(): T => {
  const params = useNextParams();
  return (params as unknown as T) || ({} as T);
};

export const useSearchParams = () => {
  const nextSearchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = usePathname();

  const setSearchParams = (
    updater: URLSearchParams | Record<string, string> | ((prev: URLSearchParams) => URLSearchParams)
  ) => {
    const current = new URLSearchParams(nextSearchParams ? nextSearchParams.toString() : '');
    let next: URLSearchParams;

    if (typeof updater === 'function') {
      next = updater(current);
    } else if (updater instanceof URLSearchParams) {
      next = updater;
    } else {
      next = new URLSearchParams(updater);
    }

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname || '/');
  };

  return [nextSearchParams || new URLSearchParams(), setSearchParams] as const;
};
