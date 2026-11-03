export const logMessage = (msg: string, err?: any): void => {
    if (err) {
        console.error(`[LOG]: ${msg}`, err);
    } else {
        console.log(`[LOG]: ${msg}`);
    }
};