import type { ReactNode } from 'react';
import { Redirect } from "@docusaurus/router";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Home(): ReactNode {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  return <Redirect to={`/${currentLocale === 'ru' ? '' : currentLocale + '/'}docs`} />;
}
