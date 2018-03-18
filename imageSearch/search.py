import numpy as np
import argparse
import cPickle
import cv2

class RGBHistogram:
	def __init__(self, bins):
		# store the number of bins the histogram will use
		self.bins = bins

	def describe(self, image):
		# compute a 3D histogram in the RGB colorspace,
		# then normalize the histogram so that images
		# with the same content, but either scaled larger
		# or smaller will have (roughly) the same histogram
		hist = cv2.calcHist([image], [0, 1, 2],
			None, self.bins, [0, 256, 0, 256, 0, 256])
		hist = cv2.normalize(hist,hist)

		# return out 3D histogram as a flattened array
		return hist.flatten()

class Searcher:
	def __init__(self, index):
		self.index = index

	def search(self, queryFeatures):
		results = {}

		
		for (k, features) in self.index.items():
			d = self.chi2_distance(features, queryFeatures)
			results[k] = d

		results = sorted([(v, k) for (k, v) in results.items()])
		return results

	def chi2_distance(self, histA, histB, eps = 1e-10):
		d = 0.5 * np.sum([((a - b) ** 2) / (a + b + eps)
			for (a, b) in zip(histA, histB)])
		return d


# parsing arguments
ap = argparse.ArgumentParser()
ap.add_argument("-d", "--dataset", required = True,
	help = "Path to the directory that contains the images we just indexed")
ap.add_argument("-i", "--index", required = True,
	help = "Path to where we stored our index")
ap.add_argument("-q", "--query", required = True,
	help = "Path to query image")
args = vars(ap.parse_args())

#query image
queryImage = cv2.imread(args["query"])
#cv2.imshow("Query", queryImage)
print "query: %s" % (args["query"])

desc = RGBHistogram([8, 8, 8])
queryFeatures = desc.describe(queryImage)
index = cPickle.loads(open(args["index"]).read())
searcher = Searcher(index)
results = searcher.search(queryFeatures)

montageA = np.zeros((166 * 4, 400, 3), dtype = "uint8")

for j in xrange(0, 4):
	(score, imageName) = results[j]
	path = imageName
	result = cv2.imread(path)
	print "\t%d. %s : %.3f" % (j + 1, imageName, score)

	if j < 4:
		montageA[j * 166:(j + 1) * 166, :] = result

cv2.imshow("Results 1-4", montageA)
#cv2.imshow("Results 6-10", montageB)
cv2.waitKey(0)

