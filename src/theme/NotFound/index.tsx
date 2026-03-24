import React, {type ReactNode, useEffect, useState} from 'react';
import NotFound from '@theme-original/NotFound';
import type NotFoundType from '@theme/NotFound';
import type {WrapperProps} from '@docusaurus/types';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

type Props = WrapperProps<typeof NotFoundType>;

const rules = [
  {prefix: '/web-dev-tools', to: 'https://devtools.siepatch.dev'},
  {prefix: '/web-devtools', to: 'https://devtools.siepatch.dev'},
  {prefix: '/web-tools', to: 'https://tools.siepatch.dev'},
];

function findRedirect(path: string): string | null {
  for (const {prefix, to} of rules) {
    if (path === prefix || path.startsWith(prefix + '/')) {
      return to + path.slice(prefix.length) + window.location.search;
    }
  }
  return null;
}

export default function NotFoundWrapper(props: Props): ReactNode {
  const [redirecting, setRedirecting] = useState<string | null | false>(null);

  useEffect(() => {
    const target = findRedirect(window.location.pathname);
    if (target) {
      setRedirecting(target);
      window.location.replace(target);
    } else {
      setRedirecting(false);
    }
  }, []);

  if (redirecting === null) {
    return null;
  }

  if (redirecting) {
    return (
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3 text--center">
            <Heading as="h1">Redirecting you...</Heading>
            <p className="margin-vert--md">
              You are being redirected to{' '}
              <Link href={redirecting}>{redirecting}</Link>
            </p>
            <p>
              If you are not redirected automatically,{' '}
              <Link href={redirecting}>click here</Link>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <NotFound {...props} />;
}
