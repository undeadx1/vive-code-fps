class Server {
  // Get high scores
  async getHighScores() {
    const scores = await $global.getCollectionItems('highScores', {
      orderBy: [{ field: 'score', direction: 'desc' }],
      limit: 10
    });
    return scores;
  }
  
  // Add a new high score
  async addHighScore(data) {
    const { playerName, score } = data;
    
    if (!playerName || typeof score !== 'number') {
      throw new Error('Invalid score data');
    }
    
    const scoreData = {
      playerName,
      score,
      date: new Date().toISOString(),
      __id: $sender.account + '_' + Date.now()
    };
    
    await $global.addCollectionItem('highScores', scoreData);
    return scoreData;
  }
}
