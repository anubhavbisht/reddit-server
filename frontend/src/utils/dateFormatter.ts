export function convertToIST(timestamp: string): string {
    const date = new Date(Number(timestamp));
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    const formattedDate = new Intl.DateTimeFormat('en-IN', options).format(date);
    return formattedDate;
}