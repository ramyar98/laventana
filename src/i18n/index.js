import ku from './languages/ku';
import bad from './languages/bad';
import ar from './languages/ar';
import fa from './languages/fa';
import en from './languages/en';
import tr from './languages/tr';

export const languages = [ku, bad, ar, fa, en, tr];

export function getLanguage(code) {
  return languages.find((l) => l.code === code) || ku;
}
