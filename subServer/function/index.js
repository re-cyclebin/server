const { rewardOne, rewardTwo, rewardThree, rewardFour, rewardFive } = require('./math')
/*
  POINT -> REWARD
  10000 -> 5000
  20000 -> 12000
  30000 -> 18000
  50000 -> 30000
  100000 -> 80000
*/

module.exports = {
  selection (num, change) {
    return new Promise ((resolve) => {
      if(Number(change) == 5000) resolve(rewardOne(num))
      else if(Number(change) == 12000) resolve(rewardTwo(num))
      else if(Number(change) == 18000) resolve(rewardThree(num))
      else if(Number(change) == 30000) resolve(rewardFour(num))
      else resolve(rewardFive(num))
    })
  }
}