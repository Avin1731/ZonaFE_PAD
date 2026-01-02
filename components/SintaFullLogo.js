import Logo from './Logo';
import { glowBetter } from '../fonts/glowBetterFont';

const SintaFullLogo = ({ size = 'large', useGlowFont = true }) => {
  const sizeClasses = {
    large: {
      container: 'space-x-3 items-center',
      logo: 'h-32 w-32',
      textContainer: 'flex flex-col justify-center text-left',
      sintaText: 'text-7xl font-bold tracking-wider leading-none',
      subText: 'text-base mt-1',
    },
    small: {
      container: 'space-x-2 items-center',
      logo: 'h-12 w-12',
      textContainer: 'flex flex-col justify-center text-left',
      sintaText: 'text-2xl font-semibold leading-none',
      subText: 'hidden',
    },
  };

  const classes = sizeClasses[size] || sizeClasses.large;

  // Hanya tambahkan glowBetter jika useGlowFont = true
  const sintaTextClass = useGlowFont
    ? `${classes.sintaText} ${glowBetter.className}`
    : classes.sintaText;

  return (
    <div className={`flex items-center ${classes.container}`}>
    <Logo className={classes.logo} aria-label="Logo SINTA" />
    <div className="flex flex-col justify-center text-left ml-2">
        <h1 className={sintaTextClass} style={{ color: '#005952', margin: 0 }}>
        SIPELITA
        </h1>
        <p className={classes.subText} style={{ color: '#005952', margin: 0, fontSize: '1rem' }}>
        Sistem Informasi Penilaian Nirwasita Tantra
        </p>
    </div>
    </div>
  );
};

export default SintaFullLogo;
