import MoviesDAO from './moviesDAO.js';

let favoritesCollection;

export default class FavoritesDAO {
    static async injectDB(conn) {
        if (favoritesCollection) {
            return;
        }
        try {
            favoritesCollection = await conn.db(
                process.env.MOVIEREVIEWS_NS
            ).collection(
                'favorites'
            );
        } catch(e) {
            console.error(`Unable to connect in FavoritesDAO: ${e}`);
        }

    }

    static async updateFavorites(userId, favorites) {
        try {
            const updateResponse = await favoritesCollection.updateOne(
                { _id: userId },
                { $set: {favorites: favorites}},
                {upsert: true}
            )
            return updateResponse
        } catch(e) {
            console.error(`Unable to update favorites: ${e}`);
            return { error: e };
        }

    }

    static async getFavorites(id) {
        let cursor;
        try {
            cursor = await favoritesCollection.find({
                _id: id
            });
            const favorites = await cursor.toArray();
            return favorites[0];
        } catch(e) {
            console.error(`Something went wrong in getFavorites: ${e}`);
            throw e;
        }

    }

    static async getMoviesByFavorites(id) {

        try {
            const favResponse = await this.getFavorites(id).then(response => {
                return response;
            });
    
            let favorites = favResponse.favorites;
            let movies = [];

            for (let i = 0; i < favorites.length; i++) {
                let movie = await MoviesDAO.getMovieById(favorites[i]);
                movies.push(movie);
            }
            return {movies};
        } catch (e) {
            console.error(`Error: ${e}`);
            throw e;
        }
    }
}