//Currency: BNB

const calculateStrategy = ({initialAmount, period, dayToStartSaving, percentToSave, crashAfter, logs = false}) => {
  const stopReinvestAfter = period - 40;
  let walletBalance = 0;
  let savingsBalance = 0;
  let activeDeposit = 0;
  let investments = [];
  let dailyHarvest = initialAmount * 0.05;
  let amountToHarvest = 0;
  let isPreviousReinvestSuccessed = true;

  const invest = (amount) => {
    if (amount >= 0.05) {
      activeDeposit += amount;

      investments.push({
        counter: 40,
        depositedAmount: amount,
        isActive: true
      });

      amountToHarvest = 0;

      return true;
    } else {
      if (logs) {
        console.log('|   Can not reinvest. Amount is too small. The strategy may be more effective with bigger initial investment');
      }
      
      withdraw();
      if (walletBalance >= 0.05) {
        activeDeposit += walletBalance;

        investments.push({
          counter: 40,
          depositedAmount: walletBalance,
          isActive: true
        });

        walletBalance = 0;
      }
      return false;
    }
  };

  const withdraw = (amount) => {
    
    if (!amount) {
      walletBalance += amountToHarvest;
      amountToHarvest = 0;
    } else if (amount <= amountToHarvest) {
      walletBalance =+ amount;
      amountToHarvest -= amount;
    }
  }

  invest(initialAmount);

  for (let i = 0; i < period; i++) {
    if (logs) {
      console.log('----------------------------------------------------------');
      console.log(`Day ${i+1} START: activeDeposit: ${activeDeposit}, dailyHarvest: ${dailyHarvest}, savingsBalance: ${savingsBalance}, walletBalance: ${walletBalance}, amountToHarvest: ${amountToHarvest}, isPreviousReinvestSuccessed: ${isPreviousReinvestSuccessed}`);
    }

    // If reached to crash day - break the loop 
    if (crashAfter > 0 && i >= crashAfter) {
      activeDeposit = 0;
      amountToHarvest = 0;
      dailyHarvest = 0;
      console.log('----------------------------------------------------------');
      console.log(`We crashed on day ${i + 1}. Your savings: ${savingsBalance}`);
      break;
    }

    // Check every investment and make unactive if reached the deadline
    investments.forEach((investment, index) => {
      const currentInvestment = investments[index];
      currentInvestment.counter -= 1;

      // If Investment reached the deadline
      if (currentInvestment.counter === 0) {
        currentInvestment.isActive = false;

        if (activeDeposit > currentInvestment.depositedAmount) {
          activeDeposit -= currentInvestment.depositedAmount;
        }

        //activeDeposit = 0;
        if (logs) {
          console.log(`-- Just removed ${currentInvestment.depositedAmount} from active deposit.`);
        }
      }
    });

    // Check if today we need to decrease our daily withdrow to put some money to savings
    if (i >= dayToStartSaving) {
      const currentSavingsPortion = dailyHarvest * (percentToSave / 100);
      savingsBalance += currentSavingsPortion;
      dailyHarvest -= currentSavingsPortion;
    }

    amountToHarvest += dailyHarvest;

    

    // If today we're not reinvesitng, we're withdrowing daily harvest to the walet and going straight to next iteration
    if (i > stopReinvestAfter) {
      if (logs) {
        console.log('Today no reinvesting. Time to withdraw!');
      }
      withdraw();
      if (i === period-1) {
        walletBalance += savingsBalance;
        savingsBalance = 0;
      }
      if (logs) {
        console.log(`Day ${i+1} END: activeDeposit: ${activeDeposit}, dailyHarvest: ${dailyHarvest}, savingsBalance: ${savingsBalance}, walletBalance: ${walletBalance}, amountToHarvest: ${amountToHarvest}, isPreviousReinvestSuccessed: ${isPreviousReinvestSuccessed}`);
      }
      continue;
    }

    // Reinvesting
    if (!isPreviousReinvestSuccessed) {
      const activeDepositSnapshot = activeDeposit;
      invest(walletBalance);
      if (activeDeposit > activeDepositSnapshot) {
        isPreviousReinvestSuccessed = true;
      }
    } else {
      isPreviousReinvestSuccessed = invest(dailyHarvest);
    }

    // Praparing daily harvest amount for the next iteration
    dailyHarvest = activeDeposit * 0.05;

    if (logs) {
      console.log(`Day ${i+1} END: activeDeposit: ${activeDeposit}, dailyHarvest: ${dailyHarvest}, savingsBalance: ${savingsBalance}, walletBalance: ${walletBalance}, amountToHarvest: ${amountToHarvest}, isPreviousReinvestSuccessed: ${isPreviousReinvestSuccessed}`);
      console.log('----------------------------------------------------------');
    }
  }

  if (crashAfter === 0 ) {
    console.log('----------------------------------------------------------');
    console.log(`Your wallet balance after ${period} days is ${walletBalance}. You ended reinvest your daily harvest after ${period - 40} days.`);
  }
};

calculateStrategy({
  initialAmount: 0.5, 
  period: 60, 
  dayToStartSaving: 600, // not relevant if not specified percent to save 
  percentToSave: 0, 
  crashAfter: 0, // 0 = without crash
  logs: true
});

// Add option to check if there is a normal bnb amount, check is bnb flow is ok and only
// after that re-invest money from last harvest

// Add option to set an amount of days as a delay between reinvestment
// Add option to set % from the accumulated harvest (after all withdrowals) to reinvest
// Stats, grapghs