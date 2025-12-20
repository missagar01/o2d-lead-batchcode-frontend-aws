declare module '../../components/batchcode/AdminLayout' {
  import { ReactNode } from 'react';
  export default function AdminLayout(props: {
    children: ReactNode;
    darkMode?: boolean;
    toggleDarkMode?: () => void;
  }): JSX.Element;
}

declare module '../../components/batchcode/HotCoilComponent' {
  export default function HotCoilComponent(): JSX.Element;
}




