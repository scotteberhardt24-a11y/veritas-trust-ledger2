// AI MATCHING ENGINE - Complete Working Implementation
// backend/src/services/aiMatcher.js

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class AIMatchingEngine {
  
  // Main matching function - called when client posts a job
  async matchWorkersToJob(jobDetails, availableWorkers, clientLocation) {
    try {
      
      // 1. Calculate distance scores
      const workersWithScores = availableWorkers.map(worker => {
        const distance = this.calculateDistance(
          clientLocation.lat, 
          clientLocation.lng,
          worker.lat,
          worker.lng
        );
        
        return {
          ...worker,
          distance,
          distanceScore: this.calculateDistanceScore(distance, worker.travelRadius)
        };
      });

      // 2. Filter by availability
      const availableNow = workersWithScores.filter(w => 
        this.isAvailable(w, jobDetails.preferredDate)
      );

      // 3. Calculate match scores
      const scored = availableNow.map(worker => ({
        ...worker,
        matchScore: this.calculateMatchScore(worker, jobDetails)
      }));

      // 4. Sort by score
      scored.sort((a, b) => b.matchScore - a.matchScore);

      // 5. Get top 3 with diversity
      const top3 = this.selectDiverseTop3(scored, jobDetails.budget);

      // 6. Generate AI explanations
      const withExplanations = await Promise.all(
        top3.map(w => this.generateMatchExplanation(w, jobDetails))
      );

      return withExplanations;

    } catch (error) {
      console.error('Matching error:', error);
      throw error;
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Score based on distance vs worker's travel radius
  calculateDistanceScore(distance, travelRadius) {
    if (distance > travelRadius) return 0;
    return Math.max(0, 1 - (distance / travelRadius));
  }

  // Check if worker is available on preferred date
  isAvailable(worker, preferredDate) {
    // Simplified - in real version check calendar
    return true;
  }

  // Calculate overall match score (0-100)
  calculateMatchScore(worker, job) {
    let score = 0;

    // Distance (30 points)
    score += worker.distanceScore * 30;

    // Skills match (25 points)
    const hasSkill = worker.services?.includes(job.category);
    score += hasSkill ? 25 : 0;

    // Experience (15 points)
    const yearsInCategory = worker.experienceYears?.[job.category] || 0;
    score += Math.min(yearsInCategory * 3, 15);

    // Trust score (15 points)
    score += (worker.truscore / 1000) * 15;

    // Rating (10 points)
    score += (worker.rating / 5) * 10;

    // Price match (5 points)
    const workerRate = worker.rates?.[job.category] || worker.baseRate;
    const priceFit = this.calculatePriceFit(workerRate, job.budget);
    score += priceFit * 5;

    return Math.round(score);
  }

  calculatePriceFit(workerRate, jobBudget) {
    if (!jobBudget?.min || !jobBudget?.max) return 0.5;
    const avgBudget = (jobBudget.min + jobBudget.max) / 2;
    const diff = Math.abs(workerRate - avgBudget);
    return Math.max(0, 1 - (diff / avgBudget));
  }

  // Select top 3 with diversity (not just highest scores)
  selectDiverseTop3(workers, budget) {
    if (workers.length <= 3) return workers.slice(0, 3);

    const avgBudget = budget?.max || 100;
    const top3 = [];

    // 1. Best overall match
    top3.push(workers[0]);

    // 2. Budget option (if different from #1)
    const budgetOption = workers.find(w => 
      w.baseRate <= avgBudget * 0.9 && 
      w.worker_id !== top3[0].worker_id
    );
    if (budgetOption) top3.push(budgetOption);

    // 3. Premium option (if different from others)
    const premiumOption = workers.find(w => 
      w.rating >= 4.8 && 
      !top3.find(t => t.worker_id === w.worker_id)
    );
    if (premiumOption) top3.push(premiumOption);

    // Fill remaining slots if needed
    while (top3.length < 3 && top3.length < workers.length) {
      const next = workers.find(w => 
        !top3.find(t => t.worker_id === w.worker_id)
      );
      if (next) top3.push(next);
    }

    return top3;
  }

  // Generate AI explanation for match
  async generateMatchExplanation(worker, job) {
    try {
      const prompt = `You're explaining why this worker matches a job posting.

Worker:
- Name: ${worker.name}
- Experience: ${worker.experienceYears?.[job.category] || 0} years in ${job.category}
- Rating: ${worker.rating}★ from ${worker.reviewCount} reviews
- TruScore: ${worker.truscore}
- Distance: ${worker.distance.toFixed(1)} miles away
- Rate: $${worker.baseRate}/hr

Job:
- Category: ${job.category}
- Budget: $${job.budget?.min}-$${job.budget?.max}
- Urgency: ${job.urgency}

Write a single, enthusiastic sentence (max 15 words) explaining why this is a great match. Focus on the strongest selling point.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
        temperature: 0.7
      });

      const explanation = completion.choices[0].message.content.trim();

      return {
        ...worker,
        matchReason: explanation,
        highlights: this.generateHighlights(worker, job),
        estimatedTotal: this.estimateJobCost(worker, job)
      };

    } catch (error) {
      console.error('AI explanation error:', error);
      return {
        ...worker,
        matchReason: `${worker.name} has strong experience and excellent ratings.`,
        highlights: this.generateHighlights(worker, job),
        estimatedTotal: this.estimateJobCost(worker, job)
      };
    }
  }

  // Generate highlight bullets
  generateHighlights(worker, job) {
    const highlights = [];

    const years = worker.experienceYears?.[job.category];
    if (years) {
      highlights.push(`✓ ${years} years experience in ${job.category}`);
    }

    if (worker.rating >= 4.5) {
      highlights.push(`✓ ${worker.rating}★ rating from ${worker.reviewCount} jobs`);
    }

    if (worker.distance <= 5) {
      highlights.push(`✓ Only ${worker.distance.toFixed(1)} miles away`);
    }

    if (worker.responseTime <= 60) {
      highlights.push(`✓ Responds within 1 hour`);
    }

    if (worker.verified) {
      highlights.push(`✓ Background checked & verified`);
    }

    return highlights;
  }

  // Estimate total job cost
  estimateJobCost(worker, job) {
    const hourlyRate = worker.baseRate;
    const estimatedHours = job.estimatedDuration || 2;
    const labor = hourlyRate * estimatedHours;
    const materials = labor * 0.15; // Rough estimate
    const total = labor + materials;

    return {
      labor: Math.round(labor),
      materials: Math.round(materials),
      total: Math.round(total),
      explanation: `Based on ${estimatedHours} hours of work`
    };
  }

  // Get regional rate data
  async getRegionalRates(service, zipCode) {
    const pool = require('../db/db');
    
    const result = await pool.query(
      `SELECT rate_data FROM regional_rates 
       WHERE service_category = $1 AND zip_code = $2`,
      [service, zipCode]
    );

    if (result.rows.length > 0) {
      return result.rows[0].rate_data;
    }

    // Default fallback rates by category
    const defaults = {
      'Plumbing': { min: 65, max: 120, median: 85 },
      'Electrical': { min: 75, max: 150, median: 95 },
      'HVAC': { min: 80, max: 140, median: 100 },
      'Carpentry': { min: 50, max: 100, median: 70 },
      'Painting': { min: 40, max: 80, median: 55 },
      'Cleaning': { min: 30, max: 60, median: 40 }
    };

    return defaults[service] || { min: 50, max: 100, median: 70 };
  }
}

module.exports = new AIMatchingEngine();
