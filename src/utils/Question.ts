import inquirer from 'inquirer'

interface answers {
  userInput: string
}
async function question (questionConfig: object): Promise<string> {
  return await inquirer.prompt([
    {
      ...questionConfig,
      name: 'userInput'
    }
  ]).then((answers: answers) => {
    return answers.userInput
  })
}

export default question
