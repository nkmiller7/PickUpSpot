import { Router } from "express";
import { locationData, userData, reviewData, gameData } from "../data/index.js";
import validation from "../data/validation.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const user = await userData.getUserByEmail(req.session.user.email);
    const usersReviews = await reviewData.getReviewsByUserId(
      user._id.toString()
    );
    const userOwnedGames = await gameData.getGamesByUserId(user._id.toString());
    const allGames = await gameData.getAllGames();

    const userParticipantGames = allGames.filter((game) =>
      game.registeredPlayers.some((id) => id.toString() === user._id.toString())
    );

    const favoritesWithLocations = await Promise.all(
      user.favorites.map(async (favorite) => {
        const location = await locationData.getLocationById(favorite);
        return location;
      })
    );

    const reviewsWithLocations = await Promise.all(
      usersReviews.map(async (review) => {
        const location = await locationData.getLocationById(
          review.locationId.toString()
        );
        return { ...review, location };
      })
    );

    const userOwnedGamesWithLocations = await Promise.all(
      userOwnedGames.map(async (game) => {
        const location = await locationData.getLocationById(
          game.locationId.toString()
        );
        return { ...game, location, isOwner: true };
      })
    );

    const userParticipantGamesWithLocations = await Promise.all(
      userParticipantGames.map(async (game) => {
        const location = await locationData.getLocationById(
          game.locationId.toString()
        );
        return { ...game, location };
      })
    );

    const combinedGames = [
      ...userOwnedGamesWithLocations,
      ...userParticipantGamesWithLocations,
    ];

    let userGamesWithLocations = combinedGames.filter(
      (game, index, self) =>
        index ===
        self.findIndex((g) => g._id.toString() === game._id.toString())
    );
    for (let i = 0; i < userGamesWithLocations.length; ++i) {
      userGamesWithLocations[i].date = userGamesWithLocations[
        i
      ].startTime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      userGamesWithLocations[i].startTimeFmt = userGamesWithLocations[
        i
      ].startTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      userGamesWithLocations[i].endTimeFmt = userGamesWithLocations[
        i
      ].endTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    res.render("profile/index", {
      user: user,
      reviews: reviewsWithLocations,
      favoriteLocations: favoritesWithLocations,
      scheduledGames: userGamesWithLocations,
      isProfilePage: true,
    });
  } catch (e) {
    res.status(404).json({ error: e.toString() });
  }
});

router.post("/toggle-anonymous", async (req, res) => {
  try {
    let { isAnonymous } = req.body;

    if (typeof isAnonymous !== "boolean") {
      return res.status(400).json({ error: "isAnonymous must be a boolean" });
    }

    const updatedUser = await userData.updateUserAnonymous(
      req.session.user.email,
      isAnonymous
    );

    req.session.user.isAnonymous = isAnonymous;

    return res.status(200).json({
      success: true,
      isAnonymous: isAnonymous,
      message: isAnonymous
        ? "Anonymous mode enabled"
        : "Anonymous mode disabled",
    });
  } catch (e) {
    console.error("Error toggling anonymous mode:", e);
    return res.status(500).json({ error: "Failed to update setting" });
  }
});

router.post("/update-favorites", async (req, res) => {
  try {
    const user = await userData.getUserByEmail(req.session.user.email);
    const { locationId, action } = req.body;

    if (!locationId || !["add", "remove"].includes(action)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    let updatedFavs;
    if (action === "add") {
      updatedFavs = [...user.favorites, locationId];
    } else {
      updatedFavs = user.favorites.filter((id) => id !== locationId);
    }

    await userData.updateUserFavorites(user.email, updatedFavs);
    res.json({ sucess: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
