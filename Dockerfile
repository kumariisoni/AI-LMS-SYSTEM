# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["backend/AI-LMS.API/AI-LMS.API.csproj", "backend/AI-LMS.API/"]
RUN dotnet restore "backend/AI-LMS.API/AI-LMS.API.csproj"

# Copy all source files and publish
COPY . .
WORKDIR "/src/backend/AI-LMS.API"
RUN dotnet publish "AI-LMS.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "AI-LMS.API.dll"]
