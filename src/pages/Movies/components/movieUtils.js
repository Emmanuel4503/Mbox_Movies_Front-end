// Format the movie release date
export const formatMovieDate = (dateString) => {
  if (!dateString) return "Release date unknown"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    const month = date.toLocaleString("default", { month: "short" })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Date error"
  }
}

// Helper function to get color based on rating
export const getRatingColor = (rating) => {
  if (!rating) return "var(--movies-text-secondary)" // For movies with no rating

  if (rating >= 8) return "var(--movies-green-rating)" // Excellent
  if (rating >= 6.5) return "var(--movies-yellow-rating)" // Good
  if (rating >= 5) return "var(--movies-yellow-rating)" // Average
  return "var(--movies-red-rating)" // Poor
}

// Parse subGenres from the backend which might be in various formats
export const parseSubGenres = (subGenres) => {
  if (!subGenres) return []

  try {
    // Handle various possible formats from the backend
    if (typeof subGenres === "string") {
      // Try to parse as JSON string
      try {
        // Handle case where it's a stringified array
        const parsed = JSON.parse(subGenres)
        if (Array.isArray(parsed)) {
          return parsed.flatMap((item) => {
            // Handle case where array items might be stringified JSON
            if (typeof item === "string" && item.startsWith("[") && item.endsWith("]")) {
              try {
                return JSON.parse(item).join(", ")
              } catch (e) {
                return item
              }
            }
            return item
          })
        }
        return [parsed]
      } catch (e) {
        // If not valid JSON, return as single item
        return [subGenres]
      }
    } else if (Array.isArray(subGenres)) {
      // Handle array of items which might be strings or objects
      return subGenres.flatMap((item) => {
        if (typeof item === "string") {
          // Check if the string is a JSON string
          if (item.startsWith("[") && item.endsWith("]")) {
            try {
              return JSON.parse(item)
            } catch (e) {
              return item
            }
          }
          return item
        } else if (typeof item === "object" && item !== null) {
          return item.name || JSON.stringify(item)
        }
        return String(item)
      })
    }

    return [String(subGenres)]
  } catch (error) {
    console.error("Error parsing subGenres:", error)
    return []
  }
}

// Format duration from minutes to hours and minutes
export const formatDuration = (minutes) => {
  if (!minutes || isNaN(minutes)) return "Duration unknown"

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  } else if (mins === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${mins}m`
  }
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 150) => {
  if (!text) return ""
  if (text.length <= maxLength) return text

  return text.substring(0, maxLength) + "..."
}

// Convert array of items to comma-separated string
export const arrayToString = (arr, defaultText = "Not specified") => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return defaultText
  return arr.join(", ")
}

// Get year from date string
export const getYearFromDate = (dateString) => {
  if (!dateString) return "Unknown year"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Unknown year"

    return date.getFullYear().toString()
  } catch (error) {
    console.error("Error getting year from date:", error)
    return "Unknown year"
  }
}

// Format a numeric value with commas for thousands
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return "0"
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Generate placeholder image URL based on movie title
export const getPlaceholderImage = (title, width = 300, height = 450) => {
  // Fallback to a colored placeholder with initials
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()

  // Use placeholder service or fallback
  return `/api/placeholder/${width}/${height}?text=${encodeURIComponent(initials)}`
}

// Format movie data for consistent use across the application
export const formatMovieData = (movie) => {
  return {
    id: movie._id || movie.imdbId || `movie-${Date.now()}`,
    title: movie.originalTitle || movie.title || "Untitled Movie",
    poster: movie.primaryImage || getPlaceholderImage(movie.originalTitle || movie.title || "Movie"),
    rating: movie.averageRating || 0,
    releaseDate: movie.releaseDate || null,
    description: movie.description || movie.overview || "",
    genres: Array.isArray(movie.genres) ? movie.genres : [],
    subGenres: parseSubGenres(movie.subGenres),
    duration: movie.runtime || movie.duration || 0,
    spokenLanguages: Array.isArray(movie.spokenLanguages) ? movie.spokenLanguages : [],
    countriesOfOrigin: Array.isArray(movie.countriesOfOrigin) ? movie.countriesOfOrigin : [],
    cast: Array.isArray(movie.cast) ? movie.cast : [],
    directors: Array.isArray(movie.directors) ? movie.directors : [],
  }
}

// Get categories from all movie genres and subgenres
export const extractCategories = (movies) => {
  const categoriesSet = new Set()

  movies.forEach((movie) => {
    if (Array.isArray(movie.genres)) {
      movie.genres.forEach((genre) => categoriesSet.add(genre))
    }

    if (Array.isArray(movie.subGenres)) {
      movie.subGenres.forEach((subGenre) => categoriesSet.add(subGenre))
    }
  })

  return Array.from(categoriesSet).sort()
}

// Convert category URL slug to display name
export const categorySlugToName = (slug) => {
  if (!slug) return "All Movies"

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Convert category name to URL slug
export const categoryNameToSlug = (name) => {
  if (!name) return "all-movies"

  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
}

// Debounce function for search input
export const debounce = (func, delay = 300) => {
  let timeoutId

  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
