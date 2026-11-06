package db;

import java.sql.*;

public class TestConnection {
    public static void main(String[] args) {
        try (Connection con = DBConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT name, party FROM political_leaders")) {
            System.out.println("Connected to Supabase!");
            while (rs.next()) {
                System.out.println(rs.getString("name") + " - " + rs.getString("party"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}