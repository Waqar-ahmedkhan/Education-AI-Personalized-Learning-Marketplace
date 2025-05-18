from EduAIRecommenderSystem import CourseRecommender

def main():
    print("\n=== Course Recommendation System ===")
    dataset = input("Enter dataset path (default: pakistani_courses_dataset.csv): ") or "pakistani_courses_dataset.csv"

    recommender = CourseRecommender(dataset)

    try:
        recommender.load_data()
        recommender.build_model()
    except:
        print("Error loading dataset or building model.")
        return

    while True:
        print("\n=== Menu ===")
        print("1. Get course recommendations")
        print("2. Exit")
        choice = input("Enter your choice: ")

        if choice == "1":
            query = input("Search by course name or topic (e.g. 'freelancing', 'mdcat', 'css'): ")
            num = int(input("How many results? (default 5): ") or 5)
            results = recommender.recommend(query, top_n=num)

            if results:
                print("\nTop Recommendations:\n")
                for i, course in enumerate(results, 1):
                    print(f"{i}. {course['title']} ({course['category']} - {course['level']})\n   {course['description']}\n")
            else:
                print("No relevant courses found.")
        elif choice == "2":
            break
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    main()
