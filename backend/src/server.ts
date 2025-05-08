import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route to handle pose comparison
app.post('/api/compare-poses', async (req, res) => {
  try {
    const { referencePoses, userPoses } = req.body;

    // Spawn Python process
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '../python/pose_similarity.py'),
      JSON.stringify({ referencePoses, userPoses })
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python process exited with code ${code}`);
        console.error(error);
        return res.status(500).json({ error: 'Error processing poses' });
      }

      try {
        const similarityResult = JSON.parse(result);
        res.json(similarityResult);
      } catch (e) {
        console.error('Error parsing Python output:', e);
        res.status(500).json({ error: 'Error processing results' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 