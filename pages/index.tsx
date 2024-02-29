import type { NextPage } from 'next';
import styles from '../styles/Home.module.css';
import Homepage from './Homepage';

const Home: NextPage = () => {

  return (
    <div className={styles.container}>
    <main className={styles.main}>
       <Homepage searchParams={null} />
       </main>
    </div>
  );
};

export default Home;