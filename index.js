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
    } 
    else {
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
      console.log(`We crashed on day ${i + 1}. Your savings: ${savingsBalance}, walletBalance: ${walletBalance}, TOTAL: ${savingsBalance + walletBalance}`);
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
    if (i >= dayToStartSaving && i <= stopReinvestAfter) {
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


//---- STRATEGY 1
// With this strategy you invest 300 dollars:
// - have ability to take 100 dollars that you made in 24 hours on day 43
// - have ability to take 300 dollars that you made in 24 hours on day 75
// - start make saving after 60 days that is ok
// - start collect good savings from day 90 (3 bnb at this spoint)
//----
// calculateStrategy({
//   initialAmount: 0.5, 
//   period: 180, 
//   dayToStartSaving: 60, // not relevant if not specified percent to save 
//   percentToSave: 20, 
//   crashAfter: 0, // 0 = without crash
//   logs: true
// });

//----- STARTEGY 2 - most optimal for the beginning
// In this case you dont need to worry about crash if it happens after day 90
//-----
// calculateStrategy({
//   initialAmount: 0.5, 
//   period: 120, // Actually if you chose more than 120 you better continue this strategy till the maximum
//   dayToStartSaving: 60, // not relevant if not specified percent to save 
//   percentToSave: 20, 
//   crashAfter: 100, // 0 = without crash
//   logs: true
// });


//----- STARTEGY 3 - think bigger
// Make 1 million dollar in 285 days (in case there is no crash)
//-----
// calculateStrategy({
//   initialAmount: 0.5, 
//   period: 285, // Actually if you chose more than 120 you better continue this strategy till the maximum
//   dayToStartSaving: 60, // not relevant if not specified percent to save 
//   percentToSave: 20, 
//   crashAfter: 0, // 0 = without crash
//   logs: true
// });


calculateStrategy({
  initialAmount: 0.5, 
  period: 285, // Actually if you chose more than 120 you better continue this strategy till the maximum
  dayToStartSaving: 60, // not relevant if not specified percent to save 
  percentToSave: 20, 
  crashAfter: 0, // 0 = without crash
  logs: true
});

//Ideas:
// Add option to set an amount of days as a delay between reinvestment

// Add option to set % from the accumulated harvest (after all withdrowals) to reinvest

// Stats, grapghs

// Check if crash happend after the day we started to harvest (and transfer to main wallet daily). If true - 
// add the harvested amount to amount of savings

//Stop make saving if we on harvest phase -- MAYBE DONE

//Add option make more deposits from outside (for example every month for a fixed amount)

// Make option to part time withdrwals just to make a few extra big savings 

// Inject AI and predict a crash based on social fear in community + statistics :D


//Steps:
//1. Make the code more clear, separate things, avoid complex loops and conditions inside conditions. FIX PROBLEMS WITH MANY NUMBERS. Make shorter. Check why the stratedy ends with positive active balance
//2. Understand all possible endings and catch them all with tests for each case (including all combinations with savings, crashes etc.)
//3. Make logical fixes, optimize strategy and find the best possible strategy variations (less risky/more risky/balanced etc. + take as parameter the minimal amount you would like to have if something crashes)
//4. Connect to web3, try to use this guide -  https://livecodestream.dev/post/interacting-with-smart-contracts-from-web-apps/
//5. Add option to check if there is a normal bnb amount, check is bnb flow is ok and only after that re-invest money from last harvest
//6. Maybe add function that shows how many days will take to reach certain amount of money (you provide as parameter) if you invest other amount (one more parameter)
//7. Check other functions in smart contract to understand if there're other ways to optimize the strategy
//8. Make all the manipulation with real wallet on BSC (interacting with BNB Harvest contract via web3.js)
//9. Write a bot that takes your wallet private key and give you to config and make a deposit (also suggest auto plans, maybe on paid basis: less risky - less money / more risky - more money / balanced).
//10. Make a website with GUI
