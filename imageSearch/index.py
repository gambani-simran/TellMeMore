# python index.py --dataset images --index index.cpickle

import argparse
import cPickle
import glob
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



ap = argparse.ArgumentParser()
ap.add_argument("-d", "--dataset", required = True,
	help = "Path to the directory that contains the images to be indexed")
ap.add_argument("-i", "--index", required = True,
	help = "Path to where the computed index will be stored")
args = vars(ap.parse_args())

index = {}

desc = RGBHistogram([8, 8, 8])

# use glob to grab the image paths and loop over them
for imagePath in glob.glob(args["dataset"] + "/*.jpg"):
	k = imagePath[imagePath.rfind("/") + 1:]

	image = cv2.imread(imagePath)
	features = desc.describe(image)
	index[k] = features


f = open(args["index"], "wb")
f.write(cPickle.dumps(index))
f.close()

print "done...indexed %d images" % (len(index))