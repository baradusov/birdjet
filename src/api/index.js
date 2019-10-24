import { db } from './config.js';
import startOfToday from 'date-fns/startOfToday';
import isToday from 'date-fns/isToday';
import format from 'date-fns/format';

/**
 * Добавление траты
 * @param {string} comment Что купили
 * @param {number} outcome Сколько потратили
 * @returns {Object} Добавленная трата
 */
export const addTransaction = async (comment, outcome) => {
  try {
    const transaction = {
      timestamp: Date.now(),
      comment: comment,
      outcome: outcome
    };
    const transactionsRef = db.collection('transactions');

    await transactionsRef.add(transaction);

    return transaction;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Получение всех трат
 * @param {number} quantity Лимит количества трат
 * @returns {Array} Траты согласно лимиту
 */
export const getTransactions = async (quantity = 10) => {
  try {
    const transactionsRef = db
      .collection('transactions')
      .orderBy('timestamp', 'desc')
      .limit(quantity);

    const transactionsSnap = await transactionsRef.get({ source: 'server' });

    const transactions = [];

    transactionsSnap.forEach(transaction => {
      transactions.push(transaction.data());
    });

    return transactions;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Пагинация трат
 * @param {number} quantity Лимит количества трат
 * @param {number} last Документ с которого начинать
 * @returns {Array} Траты согласно лимиту
 */
export const paginateTransactions = async (quantity = 15, lastVisible) => {
  try {
    const nextTransactionsRef = db
      .collection('transactions')
      .orderBy('timestamp', 'desc')
      .startAfter(lastVisible)
      .limit(quantity);
    const nextTransactionsSnap = await nextTransactionsRef.get();
    const transactions = [];

    nextTransactionsSnap.forEach(transaction => {
      transactions.push(transaction.data());
    });

    return transactions;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Получение данных аккаунта
 */
export const getAccountData = async () => {
  try {
    const accountRef = db.collection('meta').doc('account');
    const accountSnap = await accountRef.get();
    const data = await accountSnap.data();

    return data === undefined ? addAccountData(30000) : data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Добавление данных аккаунта пользователя
 * @param {number} accountData Данные пользователя (сейчас — бюджет)
 * @returns {Object} Данные аккаунта
 */
export const addAccountData = async accountData => {
  try {
    const accountRef = db.collection('meta').doc('account');
    const daysInCurrentMonth = getNumberOfDaysInCurrentMonth();
    const currentDay = getCurrentDay();
    const todaysBalance = accountData / (daysInCurrentMonth - (currentDay - 1));
    const todaysBalanceFormatted = Number.parseFloat(todaysBalance).toFixed(2);
    const startOfDay = startOfToday();
    const data = {
      lastRecalcTimestamp: startOfDay,
      budget: accountData,
      todaysBalance: todaysBalanceFormatted,
      totalBalance: accountData
    };

    /**
     * TODO: На данный момент записываем пока только бюджет,
     *       потом надо будет добавлять имя, айди и т.п.
     */
    await accountRef.set(data);

    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

/**
 * Обновление остатков
 * @param {number} outcome Добавленная трата
 * @returns {Object} Баланс на сегодня и весь
 */
export const updateBalances = async outcome => {
  try {
    const accountRef = db.collection('meta').doc('account');
    const accountSnap = await accountRef.get();
    const { todaysBalance, totalBalance } = await accountSnap.data();
    const newTodaysBalance = todaysBalance - outcome;
    const newTotalBalance = totalBalance - outcome;

    await accountRef.set(
      {
        todaysBalance: newTodaysBalance,
        totalBalance: newTotalBalance
      },
      { merge: true }
    );

    return { newTodaysBalance, newTotalBalance };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const recalcTodaysBalance = async () => {
  const { totalBalance, lastRecalcTimestamp } = await getAccountData();
  const needToRecalc = !isToday(Number(lastRecalcTimestamp));

  if (needToRecalc) {
    const accountRef = db.collection('meta').doc('account');
    const daysInCurrentMonth = getNumberOfDaysInCurrentMonth();
    const currentDay = getCurrentDay();
    const todaysBalance =
      totalBalance / (daysInCurrentMonth - (currentDay - 1));
    const todaysBalanceFormatted = Number.parseFloat(todaysBalance).toFixed(0);
    const startOfDay = format(startOfToday(), 'T');

    await accountRef.set(
      {
        lastRecalcTimestamp: startOfDay,
        todaysBalance: todaysBalanceFormatted
      },
      { merge: true }
    );
  }

  return false;
};

/**
 * Helpers
 */

/**
 * Возвращает количество дней в текущем месяце
 * @returns {number}
 */
const getNumberOfDaysInCurrentMonth = () => {
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();

  return daysInCurrentMonth;
};

/**
 * Возвращает текущий день
 * @returns {number}
 */
const getCurrentDay = () => {
  const date = new Date();
  const currentDay = date.getDate();

  return currentDay;
};

/**
 * Вывод ошибок
 * @returns {string} Текст ошибки
 */
export const getErrorMessage = errorCode => {
  switch (errorCode) {
    case 'unavailable':
      return 'Без интернета не работает 😢';
    default:
      return 'Ошибочка вышла';
  }
};
