import { Enquiry } from "@modules/product_enquiries/domain/enquiry.entity";
import { EnquiryRepository } from "@modules/product_enquiries/domain/enquiry.repository.port";
import { logMessage as log } from "@server/utils/loggers";


export class PostgresEnquiryRepository implements EnquiryRepository {
    async create(enquiry: Enquiry): Promise<Enquiry> {
        try {
            // Simulate saving the enquiry to a database
            log("Enquiry created successfully:", enquiry);
            return enquiry;
        } catch (error) {
            log("Error creating enquiry:", error);
            throw new Error("Failed to create enquiry");
        }
    }

    async findById(id: string): Promise<Enquiry | null> {
        try {
            // Simulate fetching the enquiry from a database
            const enquiry: Enquiry = {
                id,
                productId: 1,
                productTitle: "Sample Product",
                customerId: "customer123",
                customerName: "John Doe",
                customerEmail: "john.doe@example.com",
                customerPhone: "+1-555-0101",
                subject: "Sample Enquiry",
                message: "",
                status: "open"
            };
            log("Enquiry fetched successfully:", enquiry);
            return enquiry;
        } catch (error) {
            log("Error fetching enquiry:", error);
            throw new Error("Failed to fetch enquiry");
        }
    }

    async findAll(): Promise<Enquiry[]> {
        try {
            // Simulate fetching all enquiries from a database
            const enquiries: Enquiry[] = [
                {
                    id: "enquiry1",
                    productId: 1,
                    productTitle: "Sample Product 1",
                    customerId: "customer123",
                    customerName: "John Doe",
                    customerEmail: "john.doe@example.com",
                    customerPhone: "+1-555-0101",
                    subject: "Sample Enquiry 1",
                    message: "",
                    status: "open"
                },
                {
                    id: "enquiry2",
                    productId: 2,
                    productTitle: "Sample Product 2",
                    customerId: "customer456",
                    customerName: "Jane Smith",
                    customerEmail: "jane.smith@example.com",
                    customerPhone: "+1-555-0102",
                    subject: "Sample Enquiry 2",
                    message: "",
                    status: "open"
                }
            ];
            log("Enquiries fetched successfully:", enquiries);
            return enquiries;
        } catch (error) {
            log("Error fetching enquiries:", error);
            throw new Error("Failed to fetch enquiries");
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            // Simulate deleting the enquiry from a database
            log(`Enquiry with ID ${id} deleted successfully`);
            return true;
        } catch (error) {
            log("Error deleting enquiry:", error);
            throw new Error("Failed to delete enquiry");
        }
    }
}