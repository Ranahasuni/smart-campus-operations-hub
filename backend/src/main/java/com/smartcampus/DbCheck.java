import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

public class DbCheck {
    public static void main(String[] args) {
        String uri = "mongodb+srv://user:jU5WNBcw3dO3G3BL@cluster0.v6wxgah.mongodb.net/smart_campus_db";
        try (MongoClient mongoClient = MongoClients.create(uri)) {
            MongoDatabase database = mongoClient.getDatabase("smart_campus_db");
            
            System.out.println("--- USERS ---");
            MongoCollection<Document> users = database.getCollection("users");
            users.find().forEach(doc -> System.out.println(doc.getString("campusId") + " | " + doc.getString("status")));
            
            System.out.println("\n--- RESOURCES ---");
            MongoCollection<Document> resources = database.getCollection("resources");
            resources.find().forEach(doc -> System.out.println(doc.getString("name") + " | " + doc.get("status")));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
