import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserSettings, GitHubRepoInfo, Language } from '../types';

interface AppDB extends DBSchema {
  settings: {
    key: string;
    value: UserSettings;
  };
  github: {
    key: string;
    value: GitHubRepoInfo;
  };
}

let dbInstance: IDBPDatabase<AppDB> | null = null;

async function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<AppDB>('leetcode-75-sort-colors', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
      if (!db.objectStoreNames.contains('github')) {
        db.createObjectStore('github');
      }
    },
  });
  
  return dbInstance;
}

// 用户设置相关
export async function getUserSettings(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user');
  return settings || { language: 'java', speed: 1 };
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const db = await getDB();
  const current = await getUserSettings();
  await db.put('settings', { ...current, ...settings }, 'user');
}

export async function getLanguage(): Promise<Language> {
  const settings = await getUserSettings();
  return settings.language;
}

export async function saveLanguage(language: Language): Promise<void> {
  await saveUserSettings({ language });
}

export async function getSpeed(): Promise<number> {
  const settings = await getUserSettings();
  return settings.speed;
}

export async function saveSpeed(speed: number): Promise<void> {
  await saveUserSettings({ speed });
}

// GitHub信息相关
const ONE_HOUR = 60 * 60 * 1000;

export async function getGitHubStars(): Promise<number> {
  const db = await getDB();
  const info = await db.get('github', 'repo');
  
  // 如果缓存存在且未过期（1小时内），直接返回
  if (info && Date.now() - info.lastFetched < ONE_HOUR) {
    return info.stars;
  }
  
  // 尝试从GitHub API获取
  try {
    const response = await fetch('https://api.github.com/repos/fuck-algorithm/leetcode-75-sort-colors');
    if (response.ok) {
      const data = await response.json();
      const stars = data.stargazers_count || 0;
      await db.put('github', { stars, lastFetched: Date.now() }, 'repo');
      return stars;
    }
  } catch (error) {
    console.error('Failed to fetch GitHub stars:', error);
  }
  
  // 获取失败，返回缓存值或默认值
  return info?.stars || 0;
}
