const math = require('mathjs');

// Example profiles and user preferences
const profiles = [
  { id: 1, age: 28, location: 'LA', hiking: 1, photography: 0, cooking: 1 },
  { id: 2, age: 28, location: 'LA', hiking: 1, photography: 1, cooking: 0 },
  { id: 3, age: 30, location: 'LA', hiking: 0, photography: 1, cooking: 1 },
  { id: 4, age: 10, location: 'mu', hiking: 0, photography: 0, cooking: 0 },
];

const userProfile = { age: 28, location: 'LA', hiking: 0, photography: 1, cooking: 1 };

// Attributes and weights
const attributes = ['age', 'hiking', 'photography', 'cooking'];
const featureWeights = [0.2, 0.3, 0.3, 0.3];

// Normalize age
const normalize = (value, min, max) => (value - min) / (max - min);
const minAge = Math.min(...profiles.map(p => p.age), userProfile.age);
const maxAge = Math.max(...profiles.map(p => p.age), userProfile.age);

profiles.forEach(profile => {
  profile.age = normalize(profile.age, minAge, maxAge);
});
userProfile.age = normalize(userProfile.age, minAge, maxAge);

// One-hot encode location
const uniqueLocations = [...new Set(profiles.map(p => p.location).concat(userProfile.location))];
const oneHotEncodeLocation = (location, uniqueLocations) =>
  uniqueLocations.map(loc => (loc === location ? 1 : 0));

// Apply weights to a vector
const weightedVector = (vector, weights) =>
  vector.map((value, index) => value * weights[index]);

// Convert profile to weighted vector
const profileToVector = (profile, attributes, uniqueLocations, featureWeights) => {
  const basicAttributes = attributes.map(attr => profile[attr]);
  const locationVector = oneHotEncodeLocation(profile.location, uniqueLocations);
  return weightedVector(
    basicAttributes.concat(locationVector),
    featureWeights.concat(Array(locationVector.length).fill(0.1)) // Add weights for location
  );
};

// Compute cosine similarity
const cosineSimilarity = (vectorA, vectorB) => {
  const dotProduct = math.dot(vectorA, vectorB);
  const magnitudeA = math.sqrt(math.dot(vectorA, vectorA));
  const magnitudeB = math.sqrt(math.dot(vectorB, vectorB));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Compute similarity scores
const userVector = profileToVector(userProfile, attributes, uniqueLocations, featureWeights);
const profileVectors = profiles.map(profile => ({
  profile,
  vector: profileToVector(profile, attributes, uniqueLocations, featureWeights),
}));

const similarities = profileVectors.map(({ profile, vector }) => ({
  profile,
  similarity: cosineSimilarity(userVector, vector),
}));

// Sort profiles by similarity
const sortedProfiles = similarities.sort((a, b) => b.similarity - a.similarity);

// Display recommendations
console.log("Recommended Profiles:");
sortedProfiles.forEach(({ profile, similarity }) => {
  console.log(`Profile ID: ${profile.id}, Similarity: ${similarity.toFixed(8)}`);
});
